package org.example;

import ckafka.data.Swap;
import ckafka.data.SwapData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;

import java.nio.charset.StandardCharsets;
import java.util.Scanner;
import main.java.application.ModelApplication;

public class ProcessingNode extends ModelApplication implements IProcessingNode {
    private final Swap swap;
    private final ObjectMapper objectMapper;

    public ProcessingNode() {
        this.objectMapper = new ObjectMapper();
        this.swap = new Swap(objectMapper);
    }

    @Override
    public void recordReceived(ConsumerRecord record) {
        System.out.printf("Mensagem recebida de %s%n", record.key());
        try {
            SwapData data = swap.SwapDataDeserialization((byte[]) record.value());
            String text = new String(data.getMessage(), StandardCharsets.UTF_8);
            System.out.println("Mensagem recebida = " + text);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendUnicastMessage(Scanner keyboard) {
        System.out.println("UUID:\nHHHHHHHH-HHHH-HHHH-HHHH-HHHHHHHHHHHH");
        String uuid = keyboard.nextLine();
        System.out.print("Message: ");
        String messageText = keyboard.nextLine();
        System.out.printf("Sending |%s| to %s.%n", messageText, uuid);
        try {
            sendRecord(createRecord("PrivateMessageTopic", uuid,
                    swap.SwapDataSerialization(createSwapData(messageText))));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendGroupcastMessage(Scanner keyboard) {
        System.out.println("Groupcast message. Enter with the group number:\n");
        String group = keyboard.nextLine();
        System.out.print("Message: ");
        String messageText = keyboard.nextLine();
        System.out.println(String.format("Sending |%s| to group %s.", messageText, group));
        try {
            sendRecord(createRecord("GroupMessageTopic", group,
                    swap.SwapDataSerialization(createSwapData(messageText))));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
