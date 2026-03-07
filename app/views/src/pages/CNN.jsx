import React from 'react'
import Form from '../components/Form'
import MainLayout from '../components/MainLayout'
function CNN() {
  return (
    <MainLayout title="Convolutional Neural Networks">
        <Form defaultTarget="image" model="cnn" />
    </MainLayout>
  )
}

export default CNN