const path = require('path');
const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const util = require('util');
const readFilePromise = util.promisify(fs.readFile);

const APK = "apks"
const AAB = "bundles"

const baseUploadURL = 'https://www.googleapis.com/upload/androidpublisher/v3/applications';

const getAuth = keyFilePath =>
  google.auth.getClient({
    keyFile: keyFilePath,
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
  });

upload = async ({ packageName, editId, file, fileType, size, token }) => {
  let contentType;

  if (fileType == APK) {
    contentType = 'application/vnd.android.package-archive'
  } else if (fileType == AAB) {
    contentType = 'application/octet-stream'
  }

  return await axios.post(
    `${baseUploadURL}/${packageName}/edits/${editId}/${fileType}?uploadType=media&access_token=${token}`,
    file,
    {
      headers: {
        Connection: 'keep-alive',
        'accept-encoding': 'gzip, deflate',
        Accept: '*/*',
        'Content-Type': contentType,
        Authorization: token
      },
      maxContentLength: size * 1000,
      maxBodyLength: size * 1000
    }
  );
}

publish = async ({ keyFilePath, packageName, track, filePath, fileType }) => {
  try {
    const auth = await getAuth(keyFilePath);

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

    const uploadRes = await upload({ packageName, editId, file, fileType, size, token })
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

const shareAAB = async ({ keyFilePath, packageName, file }) => {
  try {
    const auth = await getAuth(keyFilePath);

    const { token } = await auth.getAccessToken();

    const url = `${baseUploadURL}/internalappsharing/${packageName}/artifacts/bundle`

    const file = await readFilePromise(filePath);
    const { size } = fs.statSync(filePath);

    const res = await axios.post(url, file, {
      headers: {
        Connection: 'keep-alive',
        'accept-encoding': 'gzip, deflate',
        Accept: '*/*',
        'Content-Type': 'application/octet-stream',
        Authorization: token
      },
      maxContentLength: size * 1000,
      maxBodyLength: size * 1000
    });
    if (res.data.downloadUrl) {
      console.log(`Internal App Sharing Download URL: ${res.data.downloadUrl}`)
    } else {
      console.log("Error retrieving Internal App Share URL")
    }
  } catch (e) {
    console.log("Error uploading to internal app share - :", e);
  }
}

exports.publishAPK = async ({ keyFilePath, packageName, track, filePath }) => {
  return await publish({ keyFilePath: keyFilePath, packageName: packageName, track: track, filePath: filePath, fileType: APK })
}

exports.publishAAB = async ({ keyFilePath, packageName, track, filePath }) => {
  return await publish({ keyFilePath: keyFilePath, packageName: packageName, track: track, filePath: filePath, fileType: AAB })
}

exports.shareAAB = async ({ keyFilePath, packageName, filePath }) => {
  return await shareAAB({ keyFilePath, packageName, filePath })
}