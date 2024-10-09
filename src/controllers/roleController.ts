import { type Request, type Response } from "express";
import roleService from "../services/roleService";

export const getRole = async (req: Request, res: Response) => {
  try {
    const roles = await roleService.getRole();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const newRole = await roleService.createRole(req.body);
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const updatedRole = roleService.updateRole(req.body, req.params.id);
    res.status(200).json(updatedRole);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const deletedRole = roleService.deleteRole(req.params.id);
    res.status(200).json(deletedRole);
  } catch (error) {
    res.status(500).json(error);
  }
};
