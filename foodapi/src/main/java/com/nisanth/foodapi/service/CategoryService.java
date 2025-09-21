package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.Category;
import com.nisanth.foodapi.repository.CategoryRepository;
import com.nisanth.foodapi.repository.FoodRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FoodRepository foodRepository;

    // Fetch all categories with food count
    public List<CategoryWithCount> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(cat -> new CategoryWithCount(cat.getId(), cat.getName(), foodRepository.countByCategory(cat.getName())))
                .collect(Collectors.toList());
    }

    // Add new category
    public Category addCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category already exists");
        }
        return categoryRepository.save(category);
    }

    // Delete category
    public void deleteCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        long count = foodRepository.countByCategory(category.getName());
        if (count > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete category with foods");
        }
        categoryRepository.deleteById(id);
    }


    // DTO class
    @AllArgsConstructor
    public static class CategoryWithCount {
        private String id;
        private String name;
        private long foodCount;

        public String getId() { return id; }
        public String getName() { return name; }
        public long getFoodCount() { return foodCount; }
    }
}
