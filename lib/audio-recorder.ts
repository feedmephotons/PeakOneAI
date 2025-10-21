/**
 * Audio Recorder Utility
 * Captures audio from MediaStream and sends chunks for transcription
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private onChunkReady: ((audioBlob: Blob) => void) | null = null

  /**
   * Start recording audio from a MediaStream
   * @param stream - Audio stream from getUserMedia or video call
   * @param onChunk - Callback when audio chunk is ready (every 5 seconds)
   * @param chunkDurationMs - How long each chunk should be (default 5000ms)
   */
  async start(
    stream: MediaStream,
    onChunk: (audioBlob: Blob) => void,
    chunkDurationMs: number = 5000
  ): Promise<void> {
    this.stream = stream
    this.onChunkReady = onChunk

    // Get only audio tracks
    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length === 0) {
      throw new Error('No audio track found in stream')
    }

    const audioStream = new MediaStream(audioTracks)

    // Create MediaRecorder
    const options: MediaRecorderOptions = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000
    }

    // Fallback if webm not supported
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      options.mimeType = 'audio/webm'
    }

    this.mediaRecorder = new MediaRecorder(audioStream, options)

    // Handle data available event
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data)
      }
    }

    // Handle stop event - send chunk for transcription
    this.mediaRecorder.onstop = () => {
      if (this.audioChunks.length > 0) {
        const audioBlob = new Blob(this.audioChunks, { type: options.mimeType })
        this.audioChunks = [] // Clear for next chunk

        if (this.onChunkReady) {
          this.onChunkReady(audioBlob)
        }
      }
    }

    // Start recording
    this.mediaRecorder.start()

    console.log('[AudioRecorder] Recording started')

    // Send chunks every X seconds
    this.startChunkInterval(chunkDurationMs)
  }

  /**
   * Start interval to send audio chunks
   */
  private startChunkInterval(intervalMs: number): void {
    const intervalId = setInterval(() => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        // Stop and immediately restart to trigger ondataavailable
        this.mediaRecorder.stop()
        this.mediaRecorder.start()
      } else {
        clearInterval(intervalId)
      }
    }, intervalMs)

    // Store interval ID for cleanup
    if (this.mediaRecorder) {
      (this.mediaRecorder as any).chunkIntervalId = intervalId
    }
  }

  /**
   * Stop recording
   */
  stop(): void {
    if (this.mediaRecorder) {
      // Clear interval
      const intervalId = (this.mediaRecorder as any).chunkIntervalId
      if (intervalId) {
        clearInterval(intervalId)
      }

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop()
      }

      this.mediaRecorder = null
      console.log('[AudioRecorder] Recording stopped')
    }
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording'
  }

  /**
   * Pause recording
   */
  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
      console.log('[AudioRecorder] Recording paused')
    }
  }

  /**
   * Resume recording
   */
  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
      console.log('[AudioRecorder] Recording resumed')
    }
  }
}

/**
 * Send audio blob to transcription API
 */
export async function transcribeAudio(
  audioBlob: Blob,
  meetingId: string,
  speakerName: string
): Promise<{ transcript: string; timestamp: string } | null> {
  try {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'audio.webm')
    formData.append('meetingId', meetingId)
    formData.append('speakerName', speakerName)

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.success && data.transcript) {
      return {
        transcript: data.transcript,
        timestamp: data.timestamp
      }
    }

    return null
  } catch (error) {
    console.error('[AudioRecorder] Transcription error:', error)
    return null
  }
}
