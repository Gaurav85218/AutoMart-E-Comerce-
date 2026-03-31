package com.example.Automobile.controller;

import com.example.Automobile.model.Product;
import com.example.Automobile.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
// In @CrossOrigin, be explicit:
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api")
public class ProductController {
    @Autowired
    private ProductService service;
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return new ResponseEntity<>(service.getProducts(), HttpStatus.OK);
    }
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable int id) {
        Product p1=service.getProductbyid(id);
        if(p1!=null){
            return new ResponseEntity<>(p1,HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    @PostMapping("/products")
    public ResponseEntity<?>  addProduct(@RequestPart Product p,@RequestPart MultipartFile imageFile) {
   try {
       Product p1=service.addProduct(p,imageFile);
       return new ResponseEntity<>(p1,HttpStatus.OK);
   }catch (Exception e){
       return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
   }
    }
    @GetMapping("/products/{id}/image")
    public ResponseEntity<byte[]> getImagebyid(@PathVariable int id) {
        Product p1=service.getProductbyid(id);
        byte[] imageFile= p1.getImagedate();
        return new ResponseEntity<>(imageFile,HttpStatus.OK);

    }
    @PutMapping("/products/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable int id,@RequestPart Product p,@RequestPart MultipartFile imageFile) {
        Product p1;
        try{
             p1=service.updateProduct(id,p,imageFile);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if(p1!=null){
            return new ResponseEntity<>("updated",HttpStatus.OK);
        }else{
            return new ResponseEntity<>("not updated",HttpStatus.BAD_REQUEST);
        }
    }
    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
Product p=service.getProductbyid(id);

if(p!=null){
    service.deleteProduct(id);
    return new ResponseEntity<>("deleted",HttpStatus.OK);
}
        return new ResponseEntity<>("not found",HttpStatus.BAD_REQUEST);
    }
}
