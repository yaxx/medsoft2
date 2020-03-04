const {app,BrowserWindow,session, Menu} = require('electron');
Menu.setApplicationMenu(null);

let win;
function createWindow () {
  win = new BrowserWindow({
    height: 700,
    width: 1290,
    backgroundColor: '#ffffff'
  });
  // win.loadURL(`file://${__dirname}/dist/front/index.html`)
  // win.loadURL('http://localhost:5000')
   win.loadURL('http://192.168.1.100:5000');
  //  win.loadURL('http://3.21.76.116:5000');
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
});
app.on('activate',function() {
  if(win===null){
    createWindow();

  }
});
