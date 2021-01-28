# Bbox object detection

## Simple object detection

Sample config to label with bboxes

You can configure labels and their colors

---

type: community
group: Computer Vision
image: /images/wizard/bbox.png

---

```xml
<View>
  <Image name="image" value="$image"/>
  <RectangleLabels name="label" toName="image">
    <Label value="Airplane" background="green"/>
    <Label value="Car" background="blue"/>
  </RectangleLabels>
</View>
```
