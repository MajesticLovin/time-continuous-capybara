package org.example;

import ckafka.data.Swap;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import main.java.ckafka.GroupDefiner;
import main.java.ckafka.GroupSelection;

import java.util.HashSet;
import java.util.Set;

public class MainGD implements GroupSelection {
    public static void main(String[] args) {
        new MainGD();
    }
    public MainGD() {
        ObjectMapper objectMapper = new ObjectMapper();
        Swap swap = new Swap(objectMapper);
        new GroupDefiner(this, swap);
    }

    @Override
    public String kafkaConsumerPrefix() {
        return "gd.one.consumer";
    }
    @Override
    public String kafkaProducerPrefix() {
        return "gd.one.producer";
    }

    @Override
    public Set<Integer> groupsIdentification() {
        Set<Integer> setOfGroups = new HashSet<Integer>();
        setOfGroups.add(20);
        setOfGroups.add(100);
        setOfGroups.add(101);
        setOfGroups.add(102);
        return setOfGroups;
    }

    @Override
    public Set<Integer> getNodesGroupByContext(ObjectNode objectNode) {
        Set<Integer> setOfGroups = new HashSet<Integer>();
        int groups = 3;
        String uuid = objectNode.get("ID").textValue();
        System.out.println("obj :" + objectNode.toPrettyString());

        int digit_id = Integer.parseInt(uuid.substring(uuid.length() - 1));
        setOfGroups.add((digit_id % groups) + 100);
        setOfGroups.add(20);
        return setOfGroups;
    }

    public Set<Integer> getNodesGroupByContext2(ObjectNode objectNode) {
        Set<Integer> setOfGroups = new HashSet<Integer>();
        int groups = 3;
        String uuid = objectNode.get("ID").textValue();
        int digit_id = Integer.parseInt(uuid.substring(uuid.length() - 1));
        setOfGroups.add((digit_id % groups) + 100);
        setOfGroups.add(20);
        return setOfGroups;
    }
}