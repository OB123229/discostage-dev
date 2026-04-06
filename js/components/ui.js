// Discover Stage — js/components/ui.js
// Shared UI components used across multiple pages
// Edit here to change buttons, inputs, etc app-wide

function BtnPrimary({children, onClick, disabled, loading, style={}}) {
  return (
    <button onClick={onClick} disabled={disabled||loading} style={{
      width:'100%', height:54, background:'#fff', color:COLORS.primary,
      border:'none', borderRadius:15, fontFamily:FONTS.main, fontSize:15,
      fontWeight:700, cursor:disabled?'default':'pointer',
      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      opacity:disabled?0.4:1, flexShrink:0, ...style,
    }}>
      {loading
        ? <div style={{width:18,height:18,border:'2px solid rgba(108,43,217,0.25)',borderTopColor:COLORS.primary,borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>
        : children}
    </button>
  );
}

function BtnOutline({children, onClick}) {
  return (
    <button onClick={onClick} style={{
      width:'100%', height:54, background:'rgba(255,255,255,0.08)', color:'#fff',
      border:'1px solid rgba(255,255,255,0.15)', borderRadius:15,
      fontFamily:FONTS.main, fontSize:15, fontWeight:600, cursor:'pointer',
      display:'flex', alignItems:'center', justifyContent:'center', gap:8, flexShrink:0,
    }}>{children}</button>
  );
}

function FInput({label, error, ...props}) {
  const [foc, setFoc] = React.useState(false);
  return (
    <div style={{marginBottom:14, flexShrink:0}}>
      {label && <label style={{display:'block',fontSize:12,fontWeight:500,color:'rgba(255,255,255,0.65)',marginBottom:7,letterSpacing:'0.5px',textTransform:'uppercase'}}>{label}</label>}
      <input {...props}
        onFocus={e=>{setFoc(true);props.onFocus&&props.onFocus(e);}}
        onBlur={e=>{setFoc(false);props.onBlur&&props.onBlur(e);}}
        style={{width:'100%',height:50,background:foc?'rgba(168,85,247,0.1)':'rgba(255,255,255,0.1)',
          border:`1px solid ${error?COLORS.error:foc?'#a855f7':'rgba(255,255,255,0.22)'}`,
          borderRadius:12,color:'#fff',fontSize:15,padding:'0 14px',outline:'none'}}/>
      {error && <p style={{fontSize:12,color:COLORS.error,marginTop:5}}>{error}</p>}
    </div>
  );
}

function ErrBanner({msg}) {
  if (!msg) return null;
  return (
    <div style={{background:'rgba(248,113,113,0.15)',border:'1px solid rgba(248,113,113,0.4)',borderRadius:12,padding:'11px 14px',fontSize:13,color:'#fca5a5',marginBottom:14,flexShrink:0}}>
      {msg}
    </div>
  );
}

function BackBtn({onClick}) {
  return (
    <button onClick={onClick} style={{background:'none',border:'none',color:'rgba(255,255,255,0.65)',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:14,padding:0,marginBottom:22,flexShrink:0}}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>Back
    </button>
  );
}

function Dots({step}) {
  return (
    <div style={{display:'flex',gap:8,marginBottom:30,flexShrink:0}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{height:4,borderRadius:2,transition:'all 0.3s',
          background:i<step?'rgba(255,255,255,0.45)':i===step?'#fff':'rgba(255,255,255,0.15)',
          width:i===step?38:22}}/>
      ))}
    </div>
  );
}

function Arrow() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
}

function Particles() {
  const items = React.useRef(Array.from({length:12},(_,i)=>({
    id:i, size:Math.random()*4+2, left:Math.random()*100,
    dur:Math.random()*8+6, delay:Math.random()*-12, op:Math.random()*0.35+0.1,
  }))).current;
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
      {items.map(p=>(
        <div key={p.id} style={{position:'absolute',width:p.size,height:p.size,borderRadius:'50%',background:'rgba(168,85,247,0.4)',left:`${p.left}%`,bottom:0,opacity:p.op,animation:`floatUp ${p.dur}s ${p.delay}s linear infinite`}}/>
      ))}
    </div>
  );
}

function Screen({children, style={}}) {
  return (
    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',padding:'52px 26px 32px',overflowY:'auto',animation:'fadeIn 0.3s ease',...style}}>
      {children}
    </div>
  );
}

function GenrePill({label, active, onClick, dark}) {
  return (
    <button onClick={onClick} style={{
      padding:'7px 16px', borderRadius:50, whiteSpace:'nowrap', cursor:'pointer',
      fontFamily:FONTS.main, fontSize:13, fontWeight:600,
      border:`1.5px solid ${active?(dark?'#fff':COLORS.primary):(dark?'rgba(255,255,255,0.35)':'rgba(123,47,190,0.3)')}`,
      background:active?(dark?'#fff':COLORS.primary):'transparent',
      color:active?(dark?COLORS.primary:'#fff'):(dark?'rgba(255,255,255,0.85)':COLORS.primary),
    }}>{label}</button>
  );
}

function EventCard({event, onClick}) {
  return (
    <div onClick={onClick} style={{background:'#fff',borderRadius:20,marginBottom:14,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',cursor:'pointer'}}>
      <div style={{height:160,background:event.color,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
          <div style={{background:'rgba(0,0,0,0.55)',borderRadius:20,padding:'5px 11px'}}>
            <span style={{color:'#fff',fontSize:11,fontWeight:500}}>✦ {event.vibe}</span>
          </div>
          <div style={{background:COLORS.primary,borderRadius:20,padding:'5px 12px'}}>
            <span style={{color:'#fff',fontSize:11,fontWeight:600}}>{event.genre}</span>
          </div>
        </div>
      </div>
      <div style={{padding:14}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:10}}>
          <div style={{width:44,height:44,borderRadius:22,background:'#DDD',marginRight:10,flexShrink:0}}/>
          <div>
            <p style={{fontFamily:FONTS.main,fontWeight:700,fontSize:15,color:'#0D0D0D',marginBottom:2}}>{event.title}</p>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{fontSize:13,color:COLORS.primary,fontWeight:500}}>{event.artist}</span>
              {event.verified && <div style={{width:7,height:7,borderRadius:4,background:COLORS.primary}}/>}
            </div>
          </div>
        </div>
        <p style={{fontSize:12,color:'#6B6B6B',marginBottom:4}}>📅 {event.date}  🕗 {event.time}</p>
        <p style={{fontSize:12,color:'#6B6B6B',marginBottom:10}}>📍 {event.venue} · {event.area}</p>
        <div style={{display:'flex',gap:16}}>
          <span style={{fontSize:12,color:'#6B6B6B'}}>⭐ <b style={{color:'#0D0D0D'}}>{event.rating}</b> rating</span>
          <span style={{fontSize:12,color:'#6B6B6B'}}>👥 <b style={{color:'#0D0D0D'}}>{event.interested}</b> interested</span>
        </div>
      </div>
    </div>
  );
}
