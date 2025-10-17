import { FaCannabis } from 'react-icons/fa';
import { BsGithub } from 'react-icons/bs';
import { BsTwitter } from 'react-icons/bs';
import { BsFacebook } from 'react-icons/bs';
import { BsInstagram } from 'react-icons/bs';
export const Dashboard = () => {
    return (
        <>
        {/* navbar */}
    <nav className="navbar navbar-expand-lg bg-body-tertiary ">
  <div className="container-fluid bg-primary ">
    <FaCannabis size={30} color="white"></FaCannabis>
    <a className="nav-link active text-white px-3 " href="#" style={{marginLeft:"550px"}}>Dashboard</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div className="navbar-nav">
        <a className="nav-link active  text-white"  href="#">My Courses</a>
        <a className="nav-link active  text-white px-3" href="#">Achievements</a>
        <a className="nav-link active  text-white" href="#">Profile</a>
     
        <button className="btn btn-danger text-light" type="submit"style={{marginLeft:"420px"}}>Logout</button>
      </div>
    </div>
  </div>
</nav>

    <div className="m-4 fw-bold h4">Dashboard</div>
    
    <ol className="d-flex justify-content-between list-unstyled w-75 ms-5 fw-medium" style={{marginLeft:"500px"}}>
        <li style={{marginLeft:"200px"}}>My Courses</li>
        <li>Achievements</li>
    </ol>
    {/* the cards */}
    <div className="row g-4 col-10 mx-auto " style={{objectFit:'cover'}}>
      <div className="col-12 col-md-6 col-lg-3 border border-1 m-5">
        <img src="/Images/pic ai.jpg" alt="user" className="w-100" />
        <h4>introduction to Web Development</h4>
        <p>Learn the basic of HTML,CSS,and js to build your first website and understand fundamentals web technologies.perfect for beginners</p>
        <div className="progress mb-3" role="progressbar" aria-label="Basic example" aria-valuenow="75" style={{height:'10px'}}>
           <div className="progress-bar w-75 bg-primary ">75%</div>
       </div>
        <button className="btn bg-primary text-white mb-3 w-100 ">start Learning</button>
      </div>

      <div className="col-12 col-md-6 col-lg-3 border border-1 m-5" >
        <img src="/Images/pic1.jpg" alt="user" className="w-100" />
        <h4>Data Science fundamentals</h4>
        <p>Explore data science ,machine learning ,algorithms, and data visualization techniques good for preparing to start data analysis</p>
        <div className="progress mb-3" role="progressbar" aria-label="Basic example" aria-valuenow="25" style={{height:'10px'}}>
           <div className="progress-bar w-25 bg-primary ">25%</div>
       </div>
         <button className="btn bg-primary text-white mb-3 w-100 ">start Learning</button>
      </div>

      <div className="col-12 col-md-6 col-lg-3 border border-1 m-5">
        <img src="/Images/tree.jpg" alt="user" className="w-100" />
        <h4 className="text-center mt-2">Do your best</h4>
        <p className="my-2 mb-5">Every hour you study brings you closer to your dreams.</p>
        <button type="button" className="btn btn-outline-primary w-100 mt-5">View All Achievements</button>
      </div>
    </div>
    {/* second row of cards */}
     <div className="row g-4 col-10 mx-auto ">
      <div className="col-12 col-md-6 col-lg-3 border border-1 m-5">
        <img src="/Images/pic4.jpg" alt="user" className="w-100" />
        <h4>Graphic Design Principles</h4>
        <p>Master compostion , color and typography to craete stunning visuals for digital and print media . unlock your creative potential</p>
        <div className="progress mb-3" role="progressbar" aria-label="Basic example" aria-valuenow="90" style={{height:'10px'}}>
           <div className="progress-bar bg-primary " style={{width:'90%'}}>90%</div>
       </div>
         <button className="btn bg-primary text-white mb-3 w-100 ">start Learning</button>
      </div>

      <div className="col-12 col-md-6 col-lg-3 border border-1 m-5" >
        <img src="/Images/pic2.jpg" alt="user" className="w-100" />
        <h4>Mobile App Essential with React Native</h4>
        <p>Build cross-platform mobile application using React Native ,Learn UI componenets , state management, and API integration for modern apps</p>
        <div className="progress mb-3" role="progressbar" aria-label="Basic example" aria-valuenow="25" style={{height:'10px'}}>
           <div className="progress-bar w-25 bg-primary ">20%</div>
       </div>
         <button className="btn bg-primary text-white mb-3 w-100 ">start Learning</button>
      </div>

      <div className="col-12 col-md-6 col-lg-3  m-5">
        <img src="/Images/pic5.jpg" alt="user" className="w-100 mt-5" />
       
      </div>
    </div>
    {/* the last row */}
    <div className="row g-4 col-10 mx-auto ">
      <div className="col-12 col-md-6 col-lg-3 border border-1 m-5">
        <img src="/Images/pic3.jpg" alt="user" className="w-100" />
        <h4>Digital Markting strategies</h4>
        <p>Understanding SEO, social media markting and content creation for business growth. Drive traffic and engage customers effectivety</p>
         <div className="progress mb-3" role="progressbar" aria-label="Basic example" aria-valuenow="60" style={{height:'10px'}}>
           <div className="progress-bar bg-primary " style={{width:'60%'}}>60%</div>
       </div>
         <button className="btn bg-primary text-white mb-3 w-100 ">start Learning</button>
      </div>
      </div>
     {/* the footer */}
     <nav className="jd-flex ustify-content-between m-0">
      <ol className="list-unstyled p-2  d-flex justify-content-start align-content-start ">
         <li className="p-3">About</li>
         <li className="p-3">Support</li>
         <li className="p-3">Legal</li>
         <span className=" d-flex justify-content-end align-content-end" style={{marginLeft:'1000px'}}>
           <li className="p-3">< BsGithub size={25} color="black"></BsGithub></li>
         <li className="p-3"><BsTwitter size={25} color="black"></BsTwitter></li>
         <li className="p-3">< BsFacebook size={25} color="black"></BsFacebook></li>
         <li className="p-3"><BsInstagram  size={25} color="black"></BsInstagram ></li>
         </span>
      </ol>
        
     </nav>
   </>
    )

}
