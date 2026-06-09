package com.academia.gymnex.controller;

import com.academia.gymnex.model.Plano;
import com.academia.gymnex.service.PlanoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/planos")
public class PlanoController {

    @Autowired
    private PlanoService planoService;

    @GetMapping
    public List<Plano> listarTodos() throws Exception {
        return planoService.listarTodos();
    }
}