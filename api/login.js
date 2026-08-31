export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).end();
  const {username,password}=req.body;
  const adminUser=process.env.ADMIN_USER;
  const adminPass=process.env.ADMIN_PASS;
  if(username===adminUser&&password===adminPass){
    const token=Buffer.from(Date.now().toString()).toString('base64');
    return res.status(200).json({ok:true,token});
  }
  return res.status(401).json({ok:false,msg:"账号密码错误"});
}
