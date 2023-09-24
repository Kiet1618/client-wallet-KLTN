import React from 'react';

export default function Logout() {
  return (
    <div></div>
  )
}

export async function getServerSideProps({ req }) {
  const headers = req ? req.headers : {};
  return { props: { headers } }
}