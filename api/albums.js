const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.POSTGRES_URL,ssl:{rejectUnauthorized:false}});

export default async function handler(req,res){
  try{
    if(req.method==='GET'){
      const r=await pool.query(
        'SELECT a.id,a.name,a.sort_order,a.time,COUNT(p.id)::int AS photo_count '+
        'FROM albums a LEFT JOIN photos p ON p.album_id=a.id '+
        'GROUP BY a.id ORDER BY a.sort_order ASC,a.id ASC'
      );
      return res.json(r.rows.map(x=>({id:x.id,name:x.name,sort_order:x.sort_order,time:x.time,photo_count:x.photo_count})));
    }
    if(req.method==='POST'){
      const {name,token}=req.body||{};
      if(!token) return res.status(401).json({ok:false});
      if(!name||!String(name).trim()) return res.status(400).json({ok:false,msg:'相册名不能为空'});
      const time=new Date().toLocaleDateString('zh-CN');
      const r=await pool.query(
        'INSERT INTO albums(name,sort_order,time) VALUES($1,COALESCE((SELECT MAX(sort_order)+1 FROM albums),0),$2) RETURNING id,name,sort_order,time',
        [String(name).trim(),time]
      );
      return res.json({ok:true,album:r.rows[0]});
    }
    if(req.method==='PATCH'){
      const {id,name,ids,token}=req.body||{};
      if(!token) return res.status(401).json({ok:false});
      if(Array.isArray(ids)){
        for(let i=0;i<ids.length;i++){
          await pool.query('UPDATE albums SET sort_order=$1 WHERE id=$2',[i,ids[i]]);
        }
        return res.json({ok:true});
      }
      if(id&&name&&String(name).trim()){
        await pool.query('UPDATE albums SET name=$1 WHERE id=$2',[String(name).trim(),id]);
        return res.json({ok:true});
      }
      return res.status(400).json({ok:false,msg:'参数错误'});
    }
    if(req.method==='DELETE'){
      const {id,token}=req.body||{};
      if(!token) return res.status(401).json({ok:false});
      await pool.query('UPDATE photos SET album_id=NULL WHERE album_id=$1',[id]);
      await pool.query('DELETE FROM albums WHERE id=$1',[id]);
      return res.json({ok:true});
    }
    res.status(405).end();
  }catch(e){
    return res.status(500).json({ok:false,msg:e.message});
  }
}
