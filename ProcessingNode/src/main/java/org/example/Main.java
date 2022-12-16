package org.example;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        Scanner keyboard = new Scanner(System.in);
        ProcessingNode PN = new ProcessingNode();
        String msg = "";
        while(!msg.equalsIgnoreCase("end")) {
            System.out.println("Desired action (Uni/Group): ");
            msg = keyboard.nextLine();
            if (msg.equalsIgnoreCase("uni"))
                PN.sendUnicastMessage(keyboard);
            else if (msg.equalsIgnoreCase("group")) {
                PN.sendGroupcastMessage(keyboard);
            }
        }
    }
}

