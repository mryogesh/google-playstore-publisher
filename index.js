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

upload = async ({ packageName, editId, file, fileType, size, token }) => {
  const uploadUrl = 'https://www.googleapis.com/upload/androidpublisher/v3/applications';

  return await axios.post(
    `${uploadUrl}/${packageName}/edits/${editId}/${fileType}?uploadType=media&access_token=${token}`,
    file,
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

}

publish = async ({ keyFilePath, packageName, track, filePath, fileType }) => {
  try {
    const auth = await getAuth({ keyFilePath });
    const { token } = await auth.getAccessToken();

    const baseUrl =
      'https://www.googleapis.com/androidpublisher/v3/applications';

    // create edit
    const { data: editRes } = await axios.post(
      `${baseUrl}/${packageName}/edits?access_token=${token}`
    );
    const { id: editId } = editRes;

    // upload apk
    const file = await readFilePromise(filePath);
    const { size } = fs.statSync(filePath);

    const uploadRes = await upload(packageName, editId, file, fileType, size, token)
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
    throw e
  }
};

exports.publishAPK = async ({ keyFilePath, packageName, track, filePath }) => {
  return await publish(keyFilePath, packageName, track, filePath, "apks")
}

exports.publishAAB = async ({ keyFilePath, packageName, track, filePath }) => {
  return await publish(keyFilePath, packageName, track, filePath, "bundles")
}