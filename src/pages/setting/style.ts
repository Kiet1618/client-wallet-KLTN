import { Card, Col, List, Row } from 'antd';
import styled from 'styled-components';


export const CardProfile = styled.div`
    display: inline-block;
    /* border: solid 1px rgb(100,100,100); */
    height: 600px;
    width: 100%;
    text-align: center;
    border-radius: 5px;
`;


export const CardMFA = styled(Card)`
    color: #fff;
    display: inline-block;
    border: none;
    background-color: rgb(40, 40, 40);
    width: 100%;
    text-align: left;
    border-radius: 5px;
    .ant-card-head-title {
        color: #fff;
    }
`;

export const CardDevices = styled(Card)`
    color: #fff;
    display: inline-block;
    border: none;
    background-color: rgb(40, 40, 40);
    width: 100%;
    text-align: left;
    border-radius: 5px;
    .ant-card-head-title {
        color: #fff;
    }
`;

export const AccountChangeContainer = styled(Col)`
    .btn-group {
        float: right;
    }
`;

export const RecoveryChangeContainer = styled(Col)`
    .btn-group {
        float: right;
        margin-top: 8px;
    }
`;

export const ChangeMFAContainer = styled(Row)`
    .ant-typography {
        color: #fff;
    }
`;

export const ListDevices = styled(List)`
    .device-info {
        color: #FFF;
    }
`