// Discover Stage — js/pages/welcome.js
// First screen users see when opening the app

function Welcome() {
  const {go} = useRouter();
  const {user, loading} = useAuth();
  React.useEffect(()=>{ if (!loading && user) go('dashboard'); },[user,loading]);
  return (
    <Screen style={{alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{width:112,height:112,borderRadius:28,background:'#0d0220',border:'1px solid rgba(168,85,247,0.35)',overflow:'hidden',marginBottom:28,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 36px rgba(168,85,247,0.2)'}}>
          <img src={LOGO} alt="Discover Stage" style={{width:100,height:100,objectFit:'contain'}}/>
        </div>
        <h1 style={{fontFamily:FONTS.main,fontSize:34,fontWeight:800,lineHeight:1.1,marginBottom:14,letterSpacing:'-0.5px'}}>
          Welcome to <span style={{background:'linear-gradient(135deg,#c084fc,#fff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Discover Stage</span>
        </h1>
        <p style={{fontSize:16,color:'rgba(255,255,255,0.7)',lineHeight:1.65,maxWidth:270,margin:'0 auto 52px'}}>
          Discover local artists and upcoming music events in your area
        </p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:11,width:'100%',flexShrink:0}}>
        <BtnPrimary onClick={()=>go('auth',{tab:'signup'})}>Get Started <Arrow/></BtnPrimary>
        <BtnOutline onClick={()=>go('auth',{tab:'signin'})}>Sign In</BtnOutline>
      </div>
    </Screen>
  );
}
