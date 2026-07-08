import { useState } from "react";
import StepRole from "./steps/StepRole";
import StepBasicInfo from "./steps/StepBasicInfo";
import StepVerifyEmail from "./steps/StepVerifyEmail";
import StepDetails from "./steps/StepDetails";
import StepPassword from "./steps/StepPassword";
import StepSuccess from "./steps/StepSuccess";

const RegisterWizard = () => {

    const [step,setStep]=useState(1);

    const [formData,setFormData]=useState({

        role:"",

        name:"",

        email:"",

        phone:"",

        userId:"",

        address:"",

        password:"",

        confirmPassword:""

    });

    return(

        <div>

            <ProgressBar step={step}/>

            {step===1 &&

                <StepRole
                    formData={formData}
                    setFormData={setFormData}
                    next={()=>setStep(2)}
                />

            }

            {step===2 &&

                <StepBasicInfo
                    formData={formData}
                    setFormData={setFormData}
                    next={()=>setStep(3)}
                    back={()=>setStep(1)}
                />

            }

            {step===3 &&

                <StepVerifyEmail
                    formData={formData}
                    next={()=>setStep(4)}
                    back={()=>setStep(2)}
                />

            }

            {step===4 &&

                <StepDetails
                    formData={formData}
                    setFormData={setFormData}
                    next={()=>setStep(5)}
                    back={()=>setStep(3)}
                />

            }

            {step===5 &&

                <StepPassword
                    formData={formData}
                    setFormData={setFormData}
                    next={()=>setStep(6)}
                    back={()=>setStep(4)}
                />

            }

            {step===6 &&

                <StepSuccess/>

            }

        </div>

    )

}


const ProgressBar = ({ step }) => {

    const totalSteps=5;

    return(

        <div className="mb-10">

            <div className="flex justify-between">

                {[1,2,3,4,5].map((item)=>(

                    <div
                        key={item}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold

                        ${step>=item

                        ?'bg-green-600'

                        :'bg-gray-300'}

                        `}
                    >

                        {item}

                    </div>

                ))}

            </div>

            <div className="mt-4 h-2 bg-gray-200 rounded">

                <div

                    className="h-2 bg-green-600 rounded transition-all duration-500"

                    style={{

                        width:`${((step-1)/(totalSteps))*100}%`

                    }}

                />

            </div>

        </div>

    )

}




export default RegisterWizard;