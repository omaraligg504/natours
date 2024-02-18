import axios from 'axios'
import { showAlert } from './alert';
//console.log("hallo from the server side");
export const login =async(email,password)=>{
    //console.log(email,password);
    console.log('l2aaaaaaaaa');
    try{const res=await axios({
        method:'POST',
        url:'http://127.0.0.1:8000/api/v1/users/login',
        data:{
            email,
            password
        }
    })

    console.log(res);
    console.log("l2aaaaaaaaaaaaaa")
    if(res.data.status==='success'){
        showAlert('success','Logged in successfully!')
        window.setTimeout(()=>{
            location.assign('/')
        },1500)
    }
    }catch(err){
        showAlert('error',err.response.data.message)
    }
}

export const logout = async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:8000/api/v1/users/logout'
      });
      if ((res.data.status = 'success')){ 
          showAlert('success','logged out successfully')
        window.setTimeout(()=>{location.reload(true)},500)
        //location.reload(true);
        }
    } catch (err) {
      //console.log(err);
      showAlert('error', 'Error logging out! Try again.');
    }
  };
  