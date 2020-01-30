const {app,BrowserWindow,session, Menu} = require('electron');
Menu.setApplicationMenu(null);

let win;
function createWindow () {
  win = new BrowserWindow({
    height: 950,
    width: 1280,
    backgroundColor: '#ffffff'
  });
  // win.loadURL(`file://${__dirname}/dist/front/index.html`)
  // win.loadURL('http://localhost:5000')
   win.loadURL('http://192.168.1.101:5000');
   win.once('ready-to-show', () => {
    win.show();
  });
    win.on('closed', function() {
    win = null;
  });

}
app.on('ready', createWindow);
app.on('windows-all-closed', () => {
  if(process.platform!=='darwin') {
    app.quit();
  }
})
app.on('activate',function() {
  if(win===null){
    createWindow();

  }
})
