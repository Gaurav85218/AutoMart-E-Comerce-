package com.example.Automobile.service;

import com.example.Automobile.model.Product;
import com.example.Automobile.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
@Service
public class ProductService {
    @Autowired
    ProductRepository repo;

    public List<Product> getProducts() {
        return repo.findAll();
    }

    public Product getProductbyid(int id) {
        return repo.findById(id).get();
    }

    public Product addProduct(Product p, MultipartFile imageFile)throws IOException{
        p.setImagename(imageFile.getOriginalFilename());
        p.setImagetype(imageFile.getContentType());
        p.setImagedate(imageFile.getBytes());
        return repo.save(p);
    }

    public Product updateProduct(int id, Product p, MultipartFile imageFile) throws IOException {
        p.setImagedate(imageFile.getBytes());
        p.setImagetype(imageFile.getContentType());
        p.setImagename(imageFile.getOriginalFilename());
        return repo.save(p);
    }

    public void deleteProduct(int id) {
        repo.deleteById(id);
    }
}
