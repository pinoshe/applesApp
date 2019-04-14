
class Apple:
    def __init__(self,id,color,size,right,x,y):
        self.id = id
        self.color = color
        self.size = size
        self.right = right
        self.pos = (x, y)

    def get_pose(self):
        return self.pos

    def get_color(self):
        return self.color

    def get_size(self):
        return self.size

    def get_id(self):
        return self.id
