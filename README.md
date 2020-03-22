# vinas_react
A web-based NAS client system(developing)

## Techs or modules
* Ant-design
* React.js
* React-router
* Axios
* JWT
* CryptoJS

## How to test this project

1. Install dependencies

   ```shell
   $ npm install
   ```

2. Edit package.json
   For example:
   ```json
   "proxy": "http://192.168.2.6:8888/",
   ```
   location is refered by server

3. Edit vinas_react/src/Pages/User/Files.js(Will fix this issue in feature)
   ```javascript
   const playMedia = (name) => {
        // Todo: CORS

        authHelper.renewToken().then((res) => {
            if(res) {
                const objectID = name;
                // Edit this line
                const url = `//PROXY_LOCATION/api/user/media/?objectID=${ objectID }&accessToken=${ localStorage.getItem('accessToken') }&refreshToken=${ localStorage.getItem('refreshToken') }`;
                setMediaURL(url);
                setIsVideoModalVisible(true);
            } else {
                authHelper.logout();
            }
        });
    }

    const downloadHandler = (objectID) => {
        // Todo: CORS

        authHelper.renewToken()
        .then((result) => {
            if(result) {
                const iframe = document.createElement('iframe');
                // Edit this line
                iframe.src = `//PROXY_LOCATION/api/user/getFile?objectID=${ objectID }&accessToken=${ localStorage.getItem('accessToken') }&refreshToken=${ localStorage.getItem('refreshToken') }`;
                iframe.style.display = 'none';
                // Todo: remove iframe by interval check
                document.body.appendChild(iframe);
            } else {
                // Todo: Error warning
            }
        })
        
    }
   ```

4. Run client
   ```bash
   $ npm start
   ```

Server implmentation: https://github.com/40443219/vinas_server