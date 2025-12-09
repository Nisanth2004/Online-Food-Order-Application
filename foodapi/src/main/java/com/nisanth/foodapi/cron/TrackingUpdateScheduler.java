package com.nisanth.foodapi.cron;

import com.fasterxml.jackson.databind.JsonNode;
import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.enumeration.OrderStatus;
import com.nisanth.foodapi.repository.OrderRepository;
import com.nisanth.foodapi.service.ShipTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TrackingUpdateScheduler {
    private final OrderRepository repo;
    private final ShipTrackingService courierService;

    @Scheduled(fixedDelay = 10*60*1000) // every 10 min
    public void syncTrackingUpdates() {
        repo.findByCourierTrackingIdNotNull().forEach(o -> {
            try {
                JsonNode data = courierService.fetchTracking(o.getCourierTrackingId());
                if (data==null || !data.has("events")) return;

                data.get("events").forEach(ev -> {
                    String msg = ev.get("status").asText();
                    LocalDateTime time = LocalDateTime.parse(ev.get("timestamp").asText());

                    boolean exists = o.getDeliveryMessages().stream()
                            .anyMatch(m->m.getMessage().equals(msg));

                    if(!exists){
                        o.addMessage(msg, time, "courier", null);

                        if(msg.toLowerCase().contains("delivered")) o.setOrderStatus(OrderStatus.DELIVERED);
                        if(msg.toLowerCase().contains("out for delivery")) o.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
                        if(msg.toLowerCase().contains("shipped")) o.setOrderStatus(OrderStatus.SHIPPED);
                    }
                });
                repo.save(o);
            } catch(Exception ignored){}
        });
    }
}
