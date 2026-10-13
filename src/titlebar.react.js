const React = require('react');
const {createRoot} = require('react-dom/client');

function TitleBar() {
  const [maximized,setMaximized] = React.useState(false);
  const controls = window.radar.windowControls;

  async function toggle() {
    await controls.toggleMaximize();
    setMaximized(await controls.isMaximized());
  }

  React.useEffect(() => {
    const sync = () => controls.isMaximized().then(setMaximized);
    sync();
    window.addEventListener('resize',sync);
    return () => window.removeEventListener('resize',sync);
  },[]);

  return React.createElement('div',{className:'radar-titlebar'},
    React.createElement('div',{className:'radar-title-drag',onDoubleClick:toggle},
      React.createElement('span',{className:'radar-title-icon'},'◎'),
      React.createElement('span',{className:'radar-title-name'},'CVE RADAR'),
      React.createElement('span',{className:'radar-title-divider'},'//'),
      React.createElement('span',{className:'radar-title-subtitle'},'INTELLIGENCE TERMINAL'),
      
    ),
    React.createElement('div',{className:'radar-window-actions'},
      React.createElement('button',{type:'button',title:'Minimize','aria-label':'Minimize',onClick:controls.minimize},'─'),
      React.createElement('button',{type:'button',title:maximized?'Restore':'Maximize','aria-label':maximized?'Restore':'Maximize',onClick:toggle},maximized?'❐':'□'),
      React.createElement('button',{type:'button',className:'radar-close',title:'Close','aria-label':'Close',onClick:controls.close},'×')
    )
  );
}

createRoot(document.getElementById('radar-react-titlebar')).render(
  React.createElement(TitleBar)
);