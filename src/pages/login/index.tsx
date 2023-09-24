import { Input } from 'antd';
import React, { useState } from 'react';
import { Button } from 'antd';
import { getSession, signIn } from 'next-auth/react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import styled from 'styled-components';
import { Row, Col } from 'antd';

export default function Login() {
    const [error, setError] = useState('');

    const ImgLoginPage = styled.img`
        height: 70vh;
        margin-top: 12vh;
    `;
    const Login = styled.div`
        height: 100vh;
        overflow: hidden;
        background-image: url('/background1.jpg');
        /* background-color: black;
        background-image: url('/bgContent.png'); */
        background-repeat: no-repeat;
        background-size: 100%;
    `;
    const ButtonOrigin = styled.button`
        border-radius: 6px;
        background-color: #505050;
        width: 300px;
        height: 50px;
        color: white;
        cursor: pointer;
    `;
    const IpnutLogin = styled.div`
        margin-top: 5vh;
        width: 80%;
        text-align: center;
        padding-top: 10vh;
        height: 90vh;
        background-color: rgb(30,30,30, 0.8);
        border-radius: 20px;
    `;
    //slider
    const CustomSlider = styled(Slider)`
        .slick-dots li button:before {
            font-size: 32px;
            color: white !important;
        }

    `;

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const result = await signIn("google", {
                callbackUrl: `${window.location.origin}/multi-factor`,
                redirect: false,
            })
            if (result?.error) {
                setError(result.error);
            }
        } catch (error) {
            setError(error.message);
        }
    };
    

    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        fade: true,
        loop: true,
        cssEase: 'linear',
        autoplay: true,
        autoplaySpeed: 5000,
        button: false,
        arrows: false,
        prevArrow: false,
        nextArrow: false,

    };


    return (
        <Login>
            <Row>
                <Col span={16}>
                    <CustomSlider {...settings}>
                        <ImgLoginPage src="/imageLogin1.svg"></ImgLoginPage>
                        <ImgLoginPage src="/imageLogin2.svg"></ImgLoginPage>
                        <ImgLoginPage src="/imageLogin3.svg"></ImgLoginPage>
                    </CustomSlider>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                    <IpnutLogin>
                        <img src="/logoLogin.png" style={{ marginBottom: '16vh' }} alt="" />
                        <br></br>
                        <Button style={{ margin: 10, width: 50, height: 50, }} type="default" size='large' shape='circle' icon={<img style={{ width: 30, height: 30 }} src='/logoGoogle.png'></img>} onClick={handleSubmit}></Button>
                        <Button style={{ margin: 10, width: 50, height: 50 }} type="default" size='large' shape='circle' icon={<img style={{ width: 30, height: 30 }} src='/facebookLogo.png'></img>}></Button>
                        <Button style={{ margin: 10, width: 50, height: 50 }} type="default" size='large' shape='circle' icon={<img style={{ width: 30, height: 30 }} src='/githubLogo.png'></img>} ></Button>
                        <Button style={{ margin: 10, width: 50, height: 50 }} type="default" size='large' shape='circle' icon={<img style={{ width: 25, height: 25 }} src='/iconMore.png'></img>} ></Button>

                        <Input.Group compact>
                            <Input placeholder='Email' style={{ width: 300, marginTop: 10, borderRadius: 5, textAlign: 'left', paddingLeft: 20, height: 40, borderColor: '#66729A' }} /> <br></br>
                            <ButtonOrigin style={{ width: 300, marginTop: 5, borderRadius: 5, height: 40 }} >Login with email</ButtonOrigin>
                        </Input.Group>
                    </IpnutLogin>
                </Col>
            </Row>
        </Login >
    )
}

export async function getServerSideProps({ req }) {
    const session = await getSession({ req });
    if (session) {
        return {
            redirect: {
                destination: "/overview",
                permanent: false
            }
        }
    }
    const headers = req ? req.headers : {};
    return { props: { headers } }

}
export async function getInitialProps({ context }) {

}