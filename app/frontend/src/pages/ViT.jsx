import React from 'react'
import Form from '../components/Form'
import MainLayout from '../components/MainLayout'
function ViT() {
  return (
    <MainLayout title="Vision Transformer">
        <Form defaultTarget="image" model="vit" />
    </MainLayout>
  )
}

export default ViT