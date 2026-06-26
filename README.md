# Voice Attendance Tracker

A simple student attendance web app that uses browser voice recognition to mark students present or absent.

## Features

- Start voice recognition to call out roll number and student name.
- Automatically marks students as present when spoken.
- Auto-fills absent students who are not marked present.
- Toggle status manually by clicking a student row.

## How to use

1. Open `index.html` in a supported browser (Chrome or Edge recommended).
2. Allow microphone access.
3. Click **Start Listening**.
4. Speak a student roll number and name, for example:
   - `Roll number 2 Rohan Sharma`
   - `4 Kabir Singh here`
   - `3 Mira Iyer present`
5. Click **Auto-fill Absentees** after voice marking is complete.

## Notes

- The web app uses the Web Speech API and works best in modern Chromium-based browsers.
- If the browser does not support speech recognition, the app will display a message.
# attendance
