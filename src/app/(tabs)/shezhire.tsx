import { Redirect } from 'expo-router';

import { familyViewHref } from '@/utils/family-view';

/** Legacy route — unified family screen lives on the Relatives tab. */
export default function ShezhireRedirectScreen() {
  return <Redirect href={familyViewHref('tree')} />;
}
