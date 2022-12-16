package org.example;

import org.apache.kafka.clients.consumer.ConsumerRecord;

public interface IProcessingNode {
    void recordReceived(ConsumerRecord record);
}
