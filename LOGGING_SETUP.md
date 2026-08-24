# Submission logging setup

GitHub Pages cannot write to a `.doc`/`.docx` file because it only serves static files. This project therefore sends correct answer submissions to a Google Apps Script web app, which appends them to a private Google Doc. Opening a hint or submitting a wrong answer is not recorded.

1. Open [Google Apps Script](https://script.google.com/) and create a new project.
2. Replace its `Code.gs` with the contents of `google-apps-script/Code.gs` from this repository.
3. In **Project Settings**, set the time zone you want recorded.
4. Select the `setup` function and click **Run** once. Grant access when prompted. The execution log contains the new Google Doc URL.
   - If the URL is not visible, select `showDocumentUrl` and click **Run**, then expand **Execution log** at the bottom of the editor.
   - You can also open Google Drive and search for **Treasure Hunt Submissions**. Do not run `setup` repeatedly; the updated script reuses the document already registered in Script Properties.
5. Click **Deploy → New deployment → Web app**.
6. Set **Execute as** to **Me** and **Who has access** to **Anyone**, then deploy.
7. Copy the `/exec` URL into `treasure-hunt/submission-config.js`.
8. Commit and push the files to GitHub Pages, then make one test submission and check the Google Doc.

The web-app URL permits submissions but does not grant visitors access to the Google Doc. Keep the document itself private. When `Code.gs` changes, deploy a new web-app version and keep the resulting URL in the config file up to date.
