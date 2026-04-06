// Discover Stage — js/pages/explore.js
// Explore screen — full screen video feed, swipe between artists
// OWNER: ___________

function ExplorePage() {
  const [genre, setGenre] = React.useState('All');
  const [idx, setIdx] = React.useState(0);
  const [liked, setLiked] = React.useState({});
  const [following, setFollowing] = React.useState({});
  const ev = EVENTS[idx % EVENTS.length];
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#000',overflow:'hidden'}}>
      {/* Genre filter overlay */}
      <div style={{position:'absolute',top:0,left:0,right:0,zIndex:10,padding:'48px 16px 10px',background:'linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <span style={{fontFamily:FONTS.main,fontSize:22,fontWeight:800,color:'#fff'}}>Explore</span>
          <span style={{background:'rgba(0,0,0,0.5)',borderRadius:20,padding:'4px 12px',fontSize:12,color:'#fff'}}>{idx+1} / {EVENTS.length}</span>
        </div>
        <div style={{display:'flex',gap:8,overflowX:'auto'}}>
          {GENRES.map(g=><GenrePill key={g} label={g} active={genre===g} onClick={()=>setGenre(g)} dark/>)}
        </div>
      </div>
      {/* Video area */}
      <div style={{flex:1,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',background:ev.color}}>
        {/* Play button */}
        <div style={{width:64,height:64,borderRadius:32,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:0,height:0,borderTop:'14px solid transparent',borderBottom:'14px solid transparent',borderLeft:'22px solid #fff',marginLeft:4}}/>
        </div>
        {/* Right action bar */}
        <div style={{position:'absolute',right:14,bottom:120,display:'flex',flexDirection:'column',gap:18,alignItems:'center'}}>
          {[
            {icon:liked[ev.id]?'❤️':'🤍', label:'234', action:()=>setLiked(p=>({...p,[ev.id]:!p[ev.id]}))},
            {icon:'👁️', label:'1520', action:null},
            {icon:'🔗', label:'Share', action:null},
            {icon:following[ev.id]?'✅':'➕', label:'Follow', action:()=>setFollowing(p=>({...p,[ev.id]:!p[ev.id]}))},
          ].map((btn,i)=>(
            <div key={i} style={{alignItems:'center',display:'flex',flexDirection:'column',gap:3}}>
              <button onClick={btn.action} style={{width:46,height:46,borderRadius:23,background:'rgba(0,0,0,0.5)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                {btn.icon}
              </button>
              <span style={{color:'#fff',fontSize:11}}>{btn.label}</span>
            </div>
          ))}
        </div>
        {/* Bottom artist info */}
        <div style={{position:'absolute',bottom:70,left:14,right:80}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
            <div style={{width:40,height:40,borderRadius:20,background:'rgba(255,255,255,0.3)',flexShrink:0}}/>
            <div>
              <p style={{fontFamily:FONTS.main,fontWeight:700,fontSize:15,color:'#fff'}}>{ev.artist}</p>
              <p style={{fontSize:12,color:'rgba(255,255,255,0.75)'}}>@{ev.artist.toLowerCase().replace(/\s/g,'')}</p>
            </div>
          </div>
          <div style={{background:COLORS.primary,borderRadius:20,padding:'6px 14px',display:'inline-block',marginBottom:6}}>
            <span style={{color:'#fff',fontSize:12,fontWeight:600}}>{ev.interested} Upcoming Events</span>
          </div>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>Tap to see upcoming shows from this artist</p>
        </div>
        {/* Prev / Next */}
        <div style={{position:'absolute',bottom:14,left:0,right:0,display:'flex',justifyContent:'center',gap:12}}>
          <button onClick={()=>setIdx(i=>Math.max(0,i-1))} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:20,padding:'8px 20px',color:'#fff',cursor:'pointer',fontSize:13}}>← Prev</button>
          <button onClick={()=>setIdx(i=>(i+1)%EVENTS.length)} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:20,padding:'8px 20px',color:'#fff',cursor:'pointer',fontSize:13}}>Next →</button>
        </div>
      </div>
    </div>
  );
}
