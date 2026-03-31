// Discover Stage — js/pages/search.js
// Search screen — find artists, events, genres
// OWNER: ___________

function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [genre, setGenre] = React.useState('All');
  const filtered = ARTISTS.filter(a=>{
    const matchQ = !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.genre.toLowerCase().includes(query.toLowerCase());
    const matchG = genre==='All' || a.genre.toLowerCase().includes(genre.toLowerCase());
    return matchQ && matchG;
  });
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#F5F5F7',overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'52px 16px 14px',background:'#F5F5F7',flexShrink:0}}>
        <p style={{fontFamily:FONTS.main,fontSize:26,fontWeight:800,color:'#0D0D0D',marginBottom:12}}>Search</p>
        <div style={{position:'relative',marginBottom:14}}>
          <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:16}}>🔍</span>
          <input type="text" placeholder="Search artists, events, genres..." value={query} onChange={e=>setQuery(e.target.value)}
            style={{width:'100%',height:46,background:'#fff',border:'1px solid #E8E8E8',borderRadius:12,fontSize:14,padding:'0 14px 0 38px',outline:'none',fontFamily:FONTS.main,boxSizing:'border-box'}}/>
        </div>
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>
          {GENRES.map(g=><GenrePill key={g} label={g} active={genre===g} onClick={()=>setGenre(g)}/>)}
        </div>
      </div>
      {/* Results */}
      <div style={{flex:1,overflowY:'auto',padding:'0 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <span style={{fontSize:16}}>👥</span>
          <span style={{fontFamily:FONTS.main,fontSize:17,fontWeight:700,color:'#0D0D0D'}}>Popular Artists</span>
        </div>
        {filtered.map(a=>(
          <div key={a.id} style={{background:'#fff',borderRadius:16,padding:'14px',marginBottom:10,display:'flex',alignItems:'center',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
            <div style={{width:56,height:56,borderRadius:28,background:'#DDD',marginRight:12,flexShrink:0}}/>
            <div style={{flex:1}}>
              <p style={{fontFamily:FONTS.main,fontWeight:700,fontSize:15,color:'#0D0D0D',marginBottom:2}}>{a.name}</p>
              <p style={{fontSize:13,color:'#6B6B6B',marginBottom:2}}>{a.genre}</p>
              <p style={{fontSize:12,color:'#6B6B6B'}}>{a.followers.toLocaleString()} followers</p>
            </div>
            <div style={{background:COLORS.primaryFaded,borderRadius:20,padding:'5px 12px'}}>
              <span style={{color:COLORS.primary,fontSize:12,fontWeight:600}}>{a.events} events</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
