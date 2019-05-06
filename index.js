const path = require('path');
const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const util = require('util');
const readFilePromise = util.promisify(fs.readFile);

const getAuth = ({ keyFilePath }) =>
  google.auth.getClient({
    keyFile: keyFilePath,
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
  });

exports.publish = async ({ keyFilePath, packageName, track, apkFilePath }) => {
  try {
    const auth = await getAuth({ keyFilePath });
    const { token } = await auth.getAccessToken();

    const baseUrl =
      'https://www.googleapis.com/androidpublisher/v3/applications';
    const uploadUrl =
      'https://www.googleapis.com/upload/androidpublisher/v3/applications';
    // create edit
    const { data: editRes } = await axios.post(
      `${baseUrl}/${packageName}/edits?access_token=${token}`
    );
    const { id: editId } = editRes;

    // upload apk
    const apk = await readFilePromise(apkFilePath);
    const { size } = fs.statSync(apkFilePath);
    const uploadRes = await axios.post(
      `${uploadUrl}/${packageName}/edits/${editId}/apks?uploadType=media&access_token=${token}`,
      apk,
      {
        headers: {
          Connection: 'keep-alive',
          'accept-encoding': 'gzip, deflate',
          Accept: '*/*',
          'Content-Type': 'application/vnd.android.package-archive',
          Authorization: token
        },
        maxContentLength: size * 1000,
        maxBodyLength: size * 1000
      }
    );
    const { versionCode } = uploadRes.data;

    // set track
    await axios.put(
      `${baseUrl}/${packageName}/edits/${editId}/tracks/${track}?access_token=${token}`,
      {
        releases: [
          {
            versionCodes: [versionCode],
            status: 'completed'
          }
        ]
      }
    );

    // commit the edit
    await axios.post(
      `${baseUrl}/${packageName}/edits/${editId}:commit?access_token=${token}`
    );

    return {
      versionCode,
      editId,
      published: true
    };
  } catch (e) {
    throw e.response.data.error;
  }
};
