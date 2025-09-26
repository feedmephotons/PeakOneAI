#!/bin/bash

echo "Fixing ESLint errors..."

# Fix activity/page.tsx - remove unused imports and fix unescaped quotes
sed -i 's/Video, Upload, Edit, Trash2,/Upload,/' app/activity/page.tsx
sed -i 's/TrendingUp, Activity/Activity/' app/activity/page.tsx
sed -i 's/Zap, Filter,//' app/activity/page.tsx
sed -i 's/RefreshCw, BarChart3,/RefreshCw,/' app/activity/page.tsx
sed -i 's/FolderOpen, Phone, Mail/Phone/' app/activity/page.tsx
sed -i 's/Star, AlertCircle,//' app/activity/page.tsx
sed -i 's/"Q4 Strategy"/\&quot;Q4 Strategy\&quot;/' app/activity/page.tsx

# Fix calendar/page.tsx - remove unused Edit
sed -i 's/, Edit//' app/calendar/page.tsx

# Fix files/page.tsx - remove unused imports and change let to const
sed -i 's/Lock,//' app/files/page.tsx
sed -i 's/, Info,/, /' app/files/page.tsx
sed -i 's/, Check,/,/' app/files/page.tsx
sed -i 's/let filteredFiles/const filteredFiles/' app/files/page.tsx

# Fix lisa/page.tsx - remove unused Users
sed -i 's/, Users//' app/lisa/page.tsx

# Fix messages/page.tsx - remove unused imports
sed -i 's/Lock, Archive, Circle/Archive/' app/messages/page.tsx
sed -i 's/, Settings//' app/messages/page.tsx
sed -i 's/X, Check, Bell,//' app/messages/page.tsx

# Fix settings/page.tsx - remove unused imports
sed -i 's/Mail, Phone, MapPin, Globe,//' app/settings/page.tsx
sed -i 's/Key, Lock, LogOut,//' app/settings/page.tsx
sed -i 's/, X,/,/' app/settings/page.tsx
sed -i 's/, AlertCircle//' app/settings/page.tsx
sed -i 's/Smartphone, Laptop, Languages, Volume2, Mic,//' app/settings/page.tsx
sed -i 's/as VideoIcon//' app/settings/page.tsx
sed -i 's/Wifi, Battery, Zap, HardDrive,//' app/settings/page.tsx
sed -i 's/, Cloud//' app/settings/page.tsx

# Fix components/KeyboardShortcuts.tsx
sed -i 's/, LogOut//' components/KeyboardShortcuts.tsx

# Fix components/notifications/NotificationProvider.tsx
sed -i 's/, Upload, Users, Zap//' components/notifications/NotificationProvider.tsx

# Fix components/onboarding/OnboardingFlow.tsx
sed -i 's/, X,/,/' components/onboarding/OnboardingFlow.tsx
echo "import { Sun, Moon, Monitor, Mail, Smartphone } from 'lucide-react'" >> components/onboarding/OnboardingFlow.tsx.tmp
cat components/onboarding/OnboardingFlow.tsx >> components/onboarding/OnboardingFlow.tsx.tmp
mv components/onboarding/OnboardingFlow.tsx.tmp components/onboarding/OnboardingFlow.tsx
sed -i "s/'d like/\&apos;d like/" components/onboarding/OnboardingFlow.tsx
sed -i "s/'s get started/\&apos;s get started/" components/onboarding/OnboardingFlow.tsx

echo "Lint fixes applied!"