import styled from 'styled-components';
import { Button } from 'antd';
import {
  Input,
  Select,
  Form,
  Modal
} from 'antd';
const { Option } = Select;
export const Transfer = styled(Form)`
  border: solid 1px rgb(100,100,100, 0.2) ;
  background-color: rgb(40,40,40 );
  display: inline-block;
  padding: 30px;
  border-radius: 5px;
  background-color: #292929;
  .ant-form-item-required, .ant-form-item-label {
    label { 
      color: #fff;
    }
  }
`;


export const SelectCustom = styled(Select)`
    color: #FFFFFF !important;
    text-align: left;
    .ant-select-selector{
      height: 50px !important;
      border-radius: 5px !important;
      color: #FFFFFF !important;
      background-color: #202020 !important;
      border: solid 1px rgb(100,100,100, 0.2) !important;

    }
    .ant-select-selection-item{
      color: #FFFFFF !important;
      height: 50px !important;
      padding-top: 9px !important;
      font-size: 18px;
    }
    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border: solid 1px rgb(100,100,100, 0.2)  !important;
    background-color: #292929 !important;
    border-radius: 5px !important;
    border: solid 1px rgb(100,100,100, 0.2) !important;
      color: #FFFFFF !important;
    }
    &:hover{
    }
    svg{
      fill: #fff !important;
    }
    
  `;
export const OptionCustom = styled(Option)`
    border: solid 1px rgb(100,100,100, 0.2) ;
    &:after {
    height: 50px;
    background-color: #292929;
    border-radius: 5px;
    padding: 10px;
    }
  `;
export const InputCustom = styled(Input)`
        font-size: 16px;
        height: 50px;
        border-radius: 5px;
        background-color: #202020 !important;
        color: #fff !important;
        border: solid 1px rgb(100,100,100, 0.2);
        display: inline-block;
        ::placeholder {
        color: gray; /* Change this to the desired placeholder color */
    }

`;
export const InputCustom2 = styled(Input)`
  font-size: 16px;
  height: 50px;
  float: left;
  border-radius: 5px;
  background-color: #202020 !important;
  color: #fff;
  display: inline-block;
  border: solid 1px rgb(100,100,100, 0.2);
  ::placeholder {
        color: gray;
        }
`;
export const GasFeeTag = styled.div`
  width: 100%;
  padding: 13px;
  font-size: 16px;
  border-radius: 5px;
  background-color: #303030;
  color: #fff;
  display: inline-block;
  border: solid 1px rgb(100,100,100, 0.2) !important;
`;

export const SelectCustom2 = styled(Select)`

    color: #FFFFFF;
    text-align: left;

    .ant-select-selector{
      height: 50px !important;
            color: #FFFFFF !important;

      border-radius: 5px !important;
      background-color: #202020 !important;
      border: solid 1px rgb(100,100,100, 0.2) !important;

    }
    .ant-select-selection-item{
      height: 50px !important;
      padding-top: 9px !important;
      font-size: 16px;
    } 
    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
      border: solid 1px rgb(100,100,100, 0.2) !important;
    background-color: #292929 !important;
    border-radius: 5px !important;
    border: solid 1px rgb(100,100,100, 0.2) !important;
    }
    &:hover{
    }
    svg{
      fill: #fff !important;
    }
    
  `;

export const CardBalance = styled.div`
  width: 100%;
  border: solid 1px rgb(100,100,100, 0.2);
  background-color: rgb(40,40,40 );
  border-radius: 5px;
  height: 200px;
  padding: 30px;
  display: inline-block;
  text-align: left;
  color: #FFF;
`;

export const ETHNumber = styled.div`
      font-size: 40px;
      margin-right: 10px;
      margin-left: 5px;
      display: inline-block;
      float: left;
      margin-top: 20px;;
  `;
export const ButtonOrigin = styled(Button)`
  border-radius: 6px;
  background-color: #505050 !important;
  color: white !important;
  cursor: pointer;
  &:hover{
    background-color: #000 !important;
  }
`;
export const CustomAddressInput = styled(Form.Item)`
  
`;
export const CustomSelectToken = styled(Form.Item)`
  margin-top: 15px;
  color: white !important;
`;
export const CustomTypeAddressInput = styled(Form.Item)`
`;

export const CustomAmount = styled(Form.Item)`
`;
export const CustomGas = styled(Form.Item)`
    text-align: left;
`;

export const CustomModal = styled(Modal)`
  .ant-modal-content{
    border-radius: 5px;
  }
  .ant-btn{
    border-radius: 5px;
  }
`;