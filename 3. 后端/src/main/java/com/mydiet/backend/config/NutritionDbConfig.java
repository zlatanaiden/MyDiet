package com.mydiet.backend.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        entityManagerFactoryRef = "nutritionEntityManagerFactory",
        transactionManagerRef = "nutritionTransactionManager",
        // CRITICAL: Specify the exact package where your Nutrition DB Repositories are located
        basePackages = {"com.mydiet.backend.nutrition.repository"} 
)
public class NutritionDbConfig {

    @Bean(name = "nutritionDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.nutrition")
    public DataSource nutritionDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "nutritionEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean nutritionEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("nutritionDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                // CRITICAL: Specify the exact package where your Nutrition DB Entities are located
                .packages("com.mydiet.backend.nutrition.entity") 
                .persistenceUnit("nutrition")
                .build();
    }

    @Bean(name = "nutritionTransactionManager")
    public PlatformTransactionManager nutritionTransactionManager(
            @Qualifier("nutritionEntityManagerFactory") EntityManagerFactory nutritionEntityManagerFactory) {
        return new JpaTransactionManager(nutritionEntityManagerFactory);
    }
}