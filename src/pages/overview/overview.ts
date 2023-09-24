import styled from 'styled-components';

export const CardBalance = styled.div`
  width: 500px;
  border: solid 1px rgb(100,100,100, 0.2);
  border-radius: 5px;
  height: 200px;
  padding: 30px;
  display: inline-block;
  margin: 0 40px;
  background-color: rgb(40,40,40 );
`;
export const CardHistory = styled.div`
  width: 500px;
  border: solid 1px rgb(100,100,100, 0.2);
  background-color: rgb(40,40,40 );

  border-radius: 5px;
  overflow-y:auto;
  padding-left: 30px;
  padding-right:30px ;
  margin: 0 40px;
  height: 330px;
`;
export const ETHNumber = styled.div`
  font-size: 40px;
  margin-right: 10px;
  margin-left: 5px;
  display: inline-block;
  float: left;
  margin-top: 20px;;
`;

export const Table = styled.table`
  width: 550px;
  height: 480px;
  text-align: center;
  
      
`;
export const ListCoin = styled.div`
  display: inline-block;
  text-align: center;
  border: solid 1px rgb(100,100,100, 0.2);
  border-radius: 5px;
  background-color: rgb(40,40,40 );

  padding: 30px;  
      th{
        font-size: 16px;
      }
      td{
        
      }
      top:0;
      right: 0;
      margin-right: 50px;
 `;
