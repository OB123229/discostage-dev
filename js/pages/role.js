// Discover Stage — js/pages/role.js
// User chooses Music Fan or Artist role during onboarding

function Role() {
  const {go} = useRouter();
  const {register} = useAuth();
  const [role, setRole] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  // const submit = async () => {
  //   if (!role) return;
  //   setLoading(true);
  //   try {
  //     const draft = JSON.parse(sessionStorage.getItem('ds_draft')||'{}');
  //     await register({...draft, role});
  //     sessionStorage.removeItem('ds_draft');
  //     go('dashboard');
  //   } catch(e){ console.error(e); }
  //   finally { setLoading(false); }
  // };
  const submit = () => {
  if (!role) return;
  sessionStorage.removeItem('ds_draft');
  go('dashboard');
};
  const ROLES = [
    {id:'FAN',    title:'Music Fan', desc:'Discover artists and attend local events in your college town',
      icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>},
    {id:'ARTIST', title:'Artist',    desc:'Promote your music and connect with fans at local venues',
      icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>},
  ];
  return (
    <Screen>
      <Dots step={2}/>
      <h2 style={{fontFamily:FONTS.main,fontSize:28,fontWeight:800,marginBottom:8,color:'#fff'}}>Join as...</h2>
      <p style={{fontSize:14,color:'rgba(255,255,255,0.7)',marginBottom:24,lineHeight:1.5}}>Choose how you want to use the app</p>
      {ROLES.map(r=>{
        const on = role===r.id;
        return (
          <div key={r.id} onClick={()=>setRole(r.id)} style={{background:on?'rgba(255,255,255,0.96)':'rgba(139,60,247,0.22)',borderRadius:17,padding:'22px 18px',cursor:'pointer',transition:'all 0.18s',marginBottom:13,flexShrink:0,outline:on?'2px solid rgba(168,85,247,0.5)':'none'}}>
            <div style={{width:46,height:46,borderRadius:13,background:on?'rgba(108,43,217,0.12)':'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,color:on?COLORS.primary:'#fff'}}>{r.icon}</div>
            <p style={{fontFamily:FONTS.main,fontSize:18,fontWeight:800,marginBottom:5,color:on?'#1a0533':'#fff'}}>{r.title}</p>
            <p style={{fontSize:13,color:on?COLORS.primary:'rgba(255,255,255,0.65)',lineHeight:1.5}}>{r.desc}</p>
          </div>
        );
      })}
      <div style={{marginTop:'auto',paddingTop:10,flexShrink:0}}>
        <BtnPrimary onClick={submit} disabled={!role} loading={loading}>Complete Setup <Arrow/></BtnPrimary>
      </div>
    </Screen>
  );
}
