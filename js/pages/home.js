// Discover Stage — js/pages/home.js
// Main Home screen — Discover Events feed
// OWNER: ___________

function HomePage() {
  const [genre, setGenre] = React.useState('All');
  const filtered = genre==='All' ? EVENTS : EVENTS.filter(e=>e.genre.toLowerCase().includes(genre.toLowerCase()));
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      {/* Purple header */}
      <div style={{background:COLORS.primary,padding:'48px 20px 16px',flexShrink:0}}>
        <p style={{fontFamily:FONTS.main,fontSize:26,fontWeight:800,color:'#fff',marginBottom:4}}>Discover Events</p>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.8)',marginBottom:14}}>Support local artists in your community</p>
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>
          {GENRES.map(g=><GenrePill key={g} label={g} active={genre===g} onClick={()=>setGenre(g)} dark/>)}
        </div>
      </div>
      {/* Content */}
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        <div style={{background:'#fff',borderRadius:12,padding:'12px 14px',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
          <span style={{fontSize:14,color:'#0D0D0D',fontWeight:500}}>📅  All Dates</span>
          <span style={{fontSize:18,color:'#6B6B6B'}}>⌄</span>
        </div>
        {filtered.map(e=><EventCard key={e.id} event={e}/>)}
      </div>
    </div>
  );
}
