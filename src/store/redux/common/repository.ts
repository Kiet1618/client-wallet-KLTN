import { METADATA_URL } from '@app/common/config';
import axios from 'axios';
export const sendRecoveryPhrase = async (email: string, phrase: string) => {
  try {
    const send = await axios.post(`${METADATA_URL}/mailer/phrase`, { email, phrase });
    return send.data;
  } catch (error) {
    console.log("🚀 ~ file: repository.ts:8 ~ sendRecoveryPhrase ~ error:", error)
  }
}

