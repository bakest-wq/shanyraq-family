import { Redirect } from 'expo-router';

/** Legacy route — settings live on the Management tab. */
export default function SettingsRedirectScreen() {
  return <Redirect href="/(tabs)/management" />;
}
