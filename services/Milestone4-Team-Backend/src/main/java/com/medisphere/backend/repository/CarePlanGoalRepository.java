package com.medisphere.backend.repository;

import com.medisphere.backend.entity.CarePlanGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarePlanGoalRepository extends JpaRepository<CarePlanGoal, Long> {
    List<CarePlanGoal> findByCarePlanIdOrderByGoalNumberAsc(Long carePlanId);
}
