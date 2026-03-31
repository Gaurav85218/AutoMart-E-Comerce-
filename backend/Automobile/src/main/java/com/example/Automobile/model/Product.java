package com.example.Automobile.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Generated;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String description;
    private String Brand;
    private BigDecimal price;
    private String category;
    private Date releaseDate;
    private int quantity;
    private boolean available;
    private String imagename;
    private String imagetype;
    @Lob
    private byte[] imagedate;

}
