// Discover Stage — js/pages/auth.js
// Login and sign up screens

function SignUpForm({onDone}) {
  const {register} = useAuth();
  const [f, setF] = React.useState({name:'',email:'',password:''});
  const [err, setErr] = React.useState({});
  const [apiErr, setApiErr] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  const validate = () => {
    const e={};
    if (!f.name.trim()) e.name='Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email='Valid email required';
    if (f.password.length<8) e.password='Min 8 characters';
    setErr(e); return Object.keys(e).length===0;
  };
  const submit = async () => {
    if (!validate()) return;
    sessionStorage.setItem('ds_draft', JSON.stringify(f));
    onDone();
  };
  return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <ErrBanner msg={apiErr}/>
      <FInput label="Full Name" type="text" placeholder="Your name" value={f.name} onChange={set('name')} error={err.name} autoComplete="name"/>
      <FInput label="Email" type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} error={err.email} autoComplete="email"/>
      <FInput label="Password" type="password" placeholder="Min 8 characters" value={f.password} onChange={set('password')} error={err.password} autoComplete="new-password"/>
      <div style={{marginTop:'auto',paddingTop:10}}>
        <BtnPrimary onClick={submit} loading={loading}>Create Account <Arrow/></BtnPrimary>
        <p style={{fontSize:11,color:'rgba(255,255,255,0.38)',textAlign:'center',marginTop:11,lineHeight:1.6}}>By signing up you agree to our Terms &amp; Privacy Policy</p>
      </div>
    </div>
  );
}

function SignInForm({onDone}) {
  const {login} = useAuth();
  const [f, setF] = React.useState({email:'',password:''});
  const [err, setErr] = React.useState({});
  const [apiErr, setApiErr] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  const validate = () => {
    const e={};
    if (!f.email) e.email='Email required';
    if (!f.password) e.password='Password required';
    setErr(e); return Object.keys(e).length===0;
  };
  const submit = async () => {
    if (!validate()) return;
    setLoading(true); setApiErr('');
    try { await login(f); onDone(); }
    catch(e) { setApiErr(e.message); }
    finally { setLoading(false); }
  };
  return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <ErrBanner msg={apiErr}/>
      <FInput label="Email" type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} error={err.email} autoComplete="email"/>
      <FInput label="Password" type="password" placeholder="Your password" value={f.password} onChange={set('password')} error={err.password} autoComplete="current-password"/>
      <div style={{marginTop:'auto',paddingTop:10}}>
        <BtnPrimary onClick={submit} loading={loading}>Sign In <Arrow/></BtnPrimary>
      </div>
    </div>
  );
}

function Auth() {
  const {go, params} = useRouter();
  const [tab, setTab] = React.useState(params.tab||'signup');
  return (
    <Screen>
      <BackBtn onClick={()=>go('welcome')}/>
      <h2 style={{fontFamily:FONTS.main,fontSize:28,fontWeight:800,marginBottom:8,letterSpacing:'-0.3px',color:'#fff'}}>{tab==='signup'?'Create Account':'Welcome Back'}</h2>
      <p style={{fontSize:14,color:'rgba(255,255,255,0.7)',marginBottom:24,lineHeight:1.5}}>{tab==='signup'?'Join the Discover Stage community':'Sign in to your account'}</p>
      <div style={{display:'flex',background:'rgba(255,255,255,0.08)',borderRadius:11,padding:4,marginBottom:22,flexShrink:0}}>
        {['signup','signin'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,height:38,border:'none',borderRadius:8,cursor:'pointer',transition:'all 0.2s',fontFamily:FONTS.main,fontSize:14,fontWeight:600,background:tab===t?'#fff':'transparent',color:tab===t?COLORS.primary:'rgba(255,255,255,0.65)'}}>
            {t==='signup'?'Sign Up':'Sign In'}
          </button>
        ))}
      </div>
      {tab==='signup' ? <SignUpForm onDone={()=>go('location')}/> : <SignInForm onDone={()=>go('dashboard')}/>}
    </Screen>
  );
}
