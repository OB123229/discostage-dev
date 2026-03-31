// Discover Stage — js/pages/location.js
// College town selection during onboarding

function Location() {
  const {go} = useRouter();
  const {user} = useAuth();
  const [query, setQuery] = React.useState('');
  const [sel, setSel] = React.useState(user&&user.town?{name:user.town,state:user.state}:null);
  const filtered = query
    ? TOWNS.filter(t=>t.name.toLowerCase().includes(query.toLowerCase())||t.state.toLowerCase().includes(query.toLowerCase()))
    : TOWNS.slice(0,8);
  const submit = () => {
    if (!sel) return;
    const draft = JSON.parse(sessionStorage.getItem('ds_draft')||'{}');
    sessionStorage.setItem('ds_draft', JSON.stringify({...draft, town:sel.name, state:sel.state}));
    go('role');
  };
  return (
    <Screen>
      <Dots step={1}/>
      <h2 style={{fontFamily:FONTS.main,fontSize:28,fontWeight:800,marginBottom:8,color:'#fff'}}>Where are you located?</h2>
      <p style={{fontSize:14,color:'rgba(255,255,255,0.7)',marginBottom:20,lineHeight:1.5}}>Select your college town</p>
      <div style={{position:'relative',marginBottom:14,flexShrink:0}}>
        <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#9370ab',pointerEvents:'none'}}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </span>
        <input type="text" placeholder="Search college towns..." value={query} onChange={e=>setQuery(e.target.value)}
          style={{width:'100%',height:50,background:'rgba(255,255,255,0.95)',border:'none',borderRadius:13,color:'#1a0533',fontSize:15,padding:'0 14px 0 42px',outline:'none'}}/>
      </div>
      {sel && (
        <div style={{display:'flex',alignItems:'center',gap:11,background:'rgba(139,60,247,0.22)',border:'1px solid rgba(168,85,247,0.4)',borderRadius:13,padding:'13px 15px',marginBottom:14,flexShrink:0}}>
          <span style={{fontSize:16}}>📍</span>
          <div style={{flex:1}}>
            <p style={{fontSize:11,color:'rgba(255,255,255,0.65)',textTransform:'uppercase',letterSpacing:'0.5px'}}>Selected</p>
            <p style={{fontFamily:FONTS.main,fontSize:15,fontWeight:700}}>{sel.name}, {sel.state}</p>
          </div>
          <button onClick={()=>setSel(null)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:20,lineHeight:1}}>×</button>
        </div>
      )}
      <p style={{fontSize:12,color:'rgba(255,255,255,0.65)',textTransform:'uppercase',letterSpacing:'0.8px',fontWeight:500,marginBottom:11,flexShrink:0}}>Popular college towns</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14,flexShrink:0}}>
        {filtered.map(t=>{
          const on = sel&&sel.name===t.name;
          return (
            <div key={t.name} onClick={()=>setSel(t)} style={{background:on?'rgba(255,255,255,0.95)':'rgba(139,60,247,0.22)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:13,padding:'14px 13px',cursor:'pointer',transition:'all 0.18s'}}>
              <p style={{fontFamily:FONTS.main,fontSize:14,fontWeight:700,color:on?COLORS.primary:'#fff',marginBottom:2}}>{t.name}</p>
              <p style={{fontSize:12,color:on?'#a855f7':'rgba(255,255,255,0.65)'}}>{t.state}</p>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:'auto',paddingTop:10,flexShrink:0}}>
        <BtnPrimary onClick={submit} disabled={!sel}>Continue <Arrow/></BtnPrimary>
      </div>
    </Screen>
  );
}
