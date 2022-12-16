package org.example;

import ckafka.data.Swap;
import ckafka.data.SwapData;
import com.fasterxml.jackson.databind.ObjectMapper;
import lac.cnclib.net.NodeConnection;
import lac.cnclib.sddl.message.ApplicationMessage;
import lac.cnclib.sddl.message.Message;
import main.java.ckafka.mobile.CKMobileNode;
import main.java.ckafka.mobile.tasks.SendLocationTask;

import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Properties;
import java.util.Scanner;
import java.util.concurrent.TimeUnit;

public class MobileNode extends CKMobileNode {
    public int type;
    private final Swap swap;
    private final ObjectMapper objectMapper;
//    private String UUID = "";

    public MobileNode(int type) {
        this.objectMapper = new ObjectMapper();
        this.swap = new Swap(objectMapper);
        this.type = type;
    }

    // Deprecated for this project
    private void sendUnicastMessage(Scanner keyboard) {
        System.out.println("Mensagem unicast. Entre com o UUID do indivíduo: ");
        String uuid = keyboard.nextLine();
        System.out.print("Entre com a mensagem: ");
        String messageText = keyboard.nextLine();
        System.out.println(String.format("Mensagem de |%s| para %s.", messageText, uuid));
        SwapData privateData = new SwapData();
        privateData.setMessage(messageText.getBytes(StandardCharsets.UTF_8));
        privateData.setTopic("PrivateMessageTopic");
        privateData.setRecipient(uuid);
        ApplicationMessage message = createDefaultApplicationMessage();
        message.setContentObject(privateData);
        sendMessageToGateway(message);
    }

    private void sendMessageToPN(Scanner keyboard) {
        System.out.print("Entre com a mensagem: ");
        String messageText = keyboard.nextLine();
        ApplicationMessage message = createDefaultApplicationMessage();
        SwapData data = new SwapData();
        data.setMessage(messageText.getBytes(StandardCharsets.UTF_8));
        data.setTopic("AppModel");
        message.setContentObject(data);
        sendMessageToGateway(message);
    }

    @Override
    public void connected(NodeConnection nodeConnection) {
        try {
            logger.debug("Connected");
            final SendLocationTask sendlocationtask = new SendLocationTask(this);
            this.scheduledFutureLocationTask = this.threadPool.scheduleWithFixedDelay(
                    sendlocationtask, 5000, 60000, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            logger.error("Error scheduling SendLocationTask", e);
        }
    }

    @Override
    public void newMessageReceived(NodeConnection nodeConnection, Message message) {
        try {
            SwapData swp = fromMessageToSwapData(message);
            if(swp.getTopic().equals("Ping")) {
                message.setSenderID(this.mnID);
                sendMessageToGateway(message);
            } else {
                String str = new String(swp.getMessage(),
                        StandardCharsets.UTF_8);
                logger.info("Message: " + str);
            }
        } catch (Exception e) {
            logger.error("Error reading new message received");
        }
    }

    @Override
    public void disconnected(NodeConnection nodeConnection) {

    }

    @Override
    public void unsentMessages(NodeConnection nodeConnection, List<Message> list) {

    }

    @Override
    public void internalException(NodeConnection nodeConnection, Exception e) {

    }
}
