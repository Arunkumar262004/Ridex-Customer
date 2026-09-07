// This app is run on a physical Android device over USB, so the backend
// is reached through `adb reverse tcp:5000 tcp:5000`, which makes the
// phone's own 'localhost:5000' transparently forward to the dev machine's
// localhost:5000 over the USB cable. Re-run that adb command any time the
// device is unplugged/replugged or `adb` restarts.
const HOST = 'localhost';

export const API_BASE_URL = `http://${HOST}:5000/api`;
export const SOCKET_URL = `http://${HOST}:5000`;
