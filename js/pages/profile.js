// Discover Stage — js/pages/profile.js
// Artist / Fan profile screen
// OWNER: ___________

function ProfilePage() {
  const {user, logout, update, del} = useAuth();
  const {go} = useRouter();
  const [view, setView] = React.useState('main');
  const [edit, setEdit] = React.useState({name:'',town:'',state:''});
  const [saving, setSaving] = React.useState(false);
  const [delConfirm, setDelConfirm] = React.useState(false);

  const SOCIALS = [
    {label:'Website',  bg:'#F0F0F0', color:'#555',    icon:'🌐'},
    {label:'Spotify',  bg:'#E8F8EF', color:'#1DB954', icon:'🎵'},
    {label:'Instagram',bg:'#FDE8F0', color:'#E1306C', icon:'📷'},
    {label:'YouTube',  bg:'#FFE8E8', color:'#FF0000', icon:'▶️'},
    {label:'Facebook', bg:'#E8F0FE', color:'#1877F2', icon:'👤'},
  ];

  const doLogout = async () => { await logout(); go('welcome'); };
  const doSave   = async () => { setSaving(true); try { await update(edit); setView('main'); } catch(e){} finally{ setSaving(false); } };
  const doDelete = async () => { try { await del(); go('welcome'); } catch(e){} };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#F5F5F7',overflow:'hidden'}}>
      {view==='main' && (
        <div style={{flex:1,overflowY:'auto'}}>
          {/* Hero banner */}
          <div style={{height:200,background:'linear-gradient(135deg,#2d0a52,#7B2FBE)',position:'relative',display:'flex',alignItems:'flex-end',padding:'14px 16px'}}>
            <div>
              <p style={{fontFamily:FONTS.main,fontSize:24,fontWeight:800,color:'#fff'}}>{user&&user.name||'Your Name'}</p>
              <p style={{fontSize:14,color:'rgba(255,255,255,0.8)'}}>{user&&user.role==='ARTIST'?'Artist':'Music Fan'}</p>
            </div>
            <div style={{position:'absolute',top:14,right:14,background:'rgba(255,255,255,0.15)',borderRadius:20,padding:'5px 14px'}}>
              <span style={{color:'#fff',fontSize:12,fontWeight:600}}>Your Profile</span>
            </div>
          </div>
          {/* Stats + bio */}
          <div style={{background:'#fff',padding:'16px',marginBottom:12,boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex',gap:24,marginBottom:12}}>
              <div><p style={{fontFamily:FONTS.main,fontSize:22,fontWeight:800,color:'#0D0D0D'}}>2,847</p><p style={{fontSize:12,color:'#6B6B6B'}}>Followers</p></div>
              <div><p style={{fontFamily:FONTS.main,fontSize:22,fontWeight:800,color:'#0D0D0D'}}>3</p><p style={{fontSize:12,color:'#6B6B6B'}}>Upcoming</p></div>
            </div>
            <p style={{fontSize:13,color:'#6B6B6B',lineHeight:1.5,marginBottom:14}}>Local indie rock band bringing nostalgic vibes with a modern twist. Known for high-energy performances and crowd interaction.</p>
            {/* Social links */}
            <div style={{borderTop:'1px solid #F0F0F0',paddingTop:14,marginBottom:14}}>
              <p style={{fontFamily:FONTS.main,fontSize:13,fontWeight:700,color:'#0D0D0D',marginBottom:10}}>Connect</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {SOCIALS.map(s=>(
                  <div key={s.label} style={{background:s.bg,borderRadius:10,padding:'7px 12px',display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                    <span style={{fontSize:13}}>{s.icon}</span>
                    <span style={{fontSize:12,fontWeight:600,color:s.color}}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Actions */}
            <div style={{borderTop:'1px solid #F0F0F0',paddingTop:14}}>
              <div style={{background:COLORS.primary,borderRadius:12,padding:'14px',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10,cursor:'pointer'}}>
                <span style={{fontSize:14}}>📊</span>
                <span style={{fontFamily:FONTS.main,color:'#fff',fontWeight:700,fontSize:15}}>My Events & Analytics</span>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{setEdit({name:user&&user.name||'',town:user&&user.town||'',state:user&&user.state||''});setView('edit');}}
                  style={{flex:1,height:44,background:'#fff',border:'1.5px solid #E0E0E0',borderRadius:12,cursor:'pointer',fontFamily:FONTS.main,fontWeight:600,fontSize:13,color:'#0D0D0D'}}>✏️ Edit Profile</button>
                <button onClick={doLogout}
                  style={{flex:1,height:44,background:'#fff',border:'1.5px solid #E0E0E0',borderRadius:12,cursor:'pointer',fontFamily:FONTS.main,fontWeight:600,fontSize:13,color:'#0D0D0D'}}>⚙️ Settings</button>
              </div>
            </div>
          </div>
          {/* Upcoming events */}
          <div style={{padding:'0 16px'}}>
            <p style={{fontFamily:FONTS.main,fontSize:17,fontWeight:700,color:'#0D0D0D',marginBottom:10}}>Upcoming Events</p>
            {EVENTS.slice(0,2).map(e=><EventCard key={e.id} event={e}/>)}
          </div>
        </div>
      )}
      {view==='edit' && (
        <div style={{flex:1,overflowY:'auto',padding:'52px 16px 16px'}}>
          <button onClick={()=>setView('main')} style={{background:'none',border:'none',color:COLORS.primary,cursor:'pointer',fontSize:14,fontWeight:600,marginBottom:16,fontFamily:FONTS.main}}>← Back</button>
          <p style={{fontFamily:FONTS.main,fontSize:20,fontWeight:800,color:'#0D0D0D',marginBottom:16}}>Edit Profile</p>
          {['name','town','state'].map(k=>(
            <div key={k} style={{marginBottom:12}}>
              <label style={{fontSize:12,color:'#6B6B6B',fontWeight:500,display:'block',marginBottom:5,textTransform:'uppercase'}}>{k}</label>
              <input value={edit[k]} onChange={e=>setEdit(p=>({...p,[k]:e.target.value}))}
                style={{width:'100%',height:46,background:'#fff',border:'1.5px solid #E0E0E0',borderRadius:12,fontSize:14,padding:'0 14px',outline:'none',fontFamily:FONTS.main,boxSizing:'border-box'}}/>
            </div>
          ))}
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button onClick={()=>setView('main')} style={{flex:1,height:46,background:'#F5F5F7',border:'none',borderRadius:12,cursor:'pointer',fontFamily:FONTS.main,fontWeight:600,fontSize:14,color:'#6B6B6B'}}>Cancel</button>
            <button onClick={doSave} style={{flex:2,height:46,background:COLORS.primary,border:'none',borderRadius:12,cursor:'pointer',fontFamily:FONTS.main,fontWeight:700,fontSize:14,color:'#fff'}}>{saving?'Saving...':'Save Changes'}</button>
          </div>
          <button onClick={doLogout} style={{width:'100%',height:44,marginTop:10,background:'#F5F5F7',border:'none',borderRadius:12,cursor:'pointer',fontFamily:FONTS.main,fontWeight:600,fontSize:14,color:'#6B6B6B'}}>Sign Out</button>
          {!delConfirm
            ? <button onClick={()=>setDelConfirm(true)} style={{width:'100%',height:44,marginTop:8,background:'none',border:'1.5px solid rgba(220,50,50,0.3)',borderRadius:12,cursor:'pointer',fontFamily:FONTS.main,fontWeight:600,fontSize:14,color:'#E53E3E'}}>Delete Account</button>
            : <div style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:12,padding:14,marginTop:8}}>
                <p style={{fontSize:13,color:'#E53E3E',marginBottom:10}}>Are you sure? This cannot be undone.</p>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setDelConfirm(false)} style={{flex:1,height:38,background:'#F5F5F7',border:'none',borderRadius:9,cursor:'pointer',fontSize:13}}>Cancel</button>
                  <button onClick={doDelete} style={{flex:1,height:38,background:'rgba(248,113,113,0.2)',border:'none',borderRadius:9,color:'#E53E3E',cursor:'pointer',fontSize:13}}>Delete</button>
                </div>
              </div>
          }
        </div>
      )}
    </div>
  );
}
