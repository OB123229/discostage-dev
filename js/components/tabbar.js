// Discover Stage — js/components/tabbar.js
// Bottom tab bar shown on all main screens

function TabBar({tab, setTab}) {
  const tabs = [
    {id:'home',    label:'Home',    icon:'🏠'},
    {id:'explore', label:'Explore', icon:'🧭'},
    {id:'add',     label:'',        icon:null},
    {id:'search',  label:'Search',  icon:'🔍'},
    {id:'profile', label:'Profile', icon:'👤'},
  ];
  return (
    <div style={{display:'flex',alignItems:'center',background:'#fff',borderTop:'1px solid #E8E8E8',height:70,flexShrink:0}}>
      {tabs.map(t => {
        if (t.id === 'add') return (
          <div key="add" style={{flex:1,display:'flex',justifyContent:'center'}}>
            <button style={{
              width:50,height:50,borderRadius:25,background:COLORS.primary,
              border:'none',cursor:'pointer',fontSize:26,color:'#fff',
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:'0 4px 12px rgba(123,47,190,0.4)',marginBottom:8,
            }}>+</button>
          </div>
        );
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,display:'flex',flexDirection:'column',alignItems:'center',
            justifyContent:'center',background:'none',border:'none',
            cursor:'pointer',gap:3,paddingTop:6,
          }}>
            <span style={{fontSize:18}}>{t.icon}</span>
            <span style={{fontSize:10,fontWeight:600,fontFamily:FONTS.main,
              color:active?COLORS.primary:'#B0B0B0'}}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
