# Live Chat English Translation Fix

## Problem
The Live Chat Management page (`/admin/chats`) was displaying hardcoded Arabic text even when the interface was set to English mode.

## Files Changed

### 1. `src/contexts/LanguageContext.tsx`
Added missing translation keys for the Live Chat page:

**English translations added:**
- `page.admin_chats.avg_response_value`: '< 2 mins'
- `page.admin_chats.conversations`: 'Conversations'
- `page.admin_chats.no_conversations`: 'No conversations yet'
- `page.admin_chats.message_label`: 'Message'
- `page.admin_chats.active_status`: 'Active'
- `page.admin_chats.closed_status`: 'Closed'
- `page.admin_chats.today`: 'Today'
- `page.admin_chats.yesterday`: 'Yesterday'
- `page.admin_chats.select_conversation`: 'Select a conversation'
- `page.admin_chats.select_conversation_desc`: 'Choose a conversation from the list on the left to start replying to messages'
- `page.admin_chats.type_message`: 'Type your message...'
- `page.admin_chats.support_team`: 'Support Team'

**Arabic translations added:**
- Same keys with Arabic equivalents

### 2. `src/app/admin/chats/page.tsx`
Replaced all 14 hardcoded Arabic strings with translation keys:

1. ✅ Average response time value: `'< 2 دقيقة'` → `t('page.admin_chats.avg_response_value')`
2. ✅ Conversations header: `'المحادثات'` → `t('page.admin_chats.conversations')`
3. ✅ No conversations message: `'لا توجد محادثات بعد'` → `t('page.admin_chats.no_conversations')`
4. ✅ Message label badge: `'رسالة'` → `t('page.admin_chats.message_label')`
5. ✅ Active status: `'نشط'` → `t('page.admin_chats.active_status')`
6. ✅ Closed status: `'مغلق'` → `t('page.admin_chats.closed_status')`
7. ✅ Today label (conversation list): `'اليوم'` → `t('page.admin_chats.today')`
8. ✅ Yesterday label (conversation list): `'أمس'` → `t('page.admin_chats.yesterday')`
9. ✅ Today label (message divider): `'اليوم'` → `t('page.admin_chats.today')`
10. ✅ Yesterday label (message divider): `'أمس'` → `t('page.admin_chats.yesterday')`
11. ✅ Message input placeholder: `'اكتب رسالتك...'` → `t('page.admin_chats.type_message')`
12. ✅ Select conversation title: `'اختر محادثة'` → `t('page.admin_chats.select_conversation')`
13. ✅ Select conversation description: `'حدد محادثة من القائمة...'` → `t('page.admin_chats.select_conversation_desc')`
14. ✅ Support team name (2 occurrences): `'فريق الدعم'` → `t('page.admin_chats.support_team')`

### Language-Aware Date/Time Formatting
Updated all date and time displays to use language-aware formatting:
- `toLocaleDateString('ar-EG')` → `toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')`
- `toLocaleTimeString('ar-EG')` → `toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US')`

Added `language` to `useLanguage()` destructuring to support locale formatting.

## Verification
✅ TypeScript compilation: `npm run typecheck` - No errors
✅ All hardcoded Arabic strings replaced with translation keys
✅ Date and time formatting now respects language selection

## Result
The Live Chat Management page now correctly displays:
- **English mode**: All text in English with English date/time formats
- **Arabic mode**: All text in Arabic with Arabic date/time formats

The page will automatically switch between languages when the user changes the language setting in the header.
